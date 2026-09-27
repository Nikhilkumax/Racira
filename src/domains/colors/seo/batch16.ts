import type { ToolSeo } from "@/components/shared/seo-types";

/**
 * Colors domain editorial SEO — batch 16 (the gradient cluster).
 *
 * Skipped from this window:
 *  - frosted-glass-generator — renders the identical GlassmorphismGenerator as
 *    glassmorphism-generator (authored here), so the two pages would be the same
 *    tool under two names. The emitted CSS is the glassmorphism recipe (tinted
 *    translucent panel, backdrop blur, hairline highlight border), so the
 *    glassmorphism slug is the one that keeps its page; the frosted-glass slug is
 *    the obvious candidate for a variant prop on the shared component.
 *  - gradient-previewer and the remaining gradient slugs (reverser, to-css-exporter,
 *    linear/radial generators) are deferred to batch 17.
 */
export const SEO_BATCH_16: Record<string, ToolSeo> = {
  "glassmorphism-generator": {
    keywords: [
      "glassmorphism generator",
      "glassmorphism css",
      "frosted glass css",
      "glass effect css",
      "css backdrop blur glass",
    ],
    intro:
      "The glassmorphism generator writes a complete CSS snippet for a frosted glass panel — tinted translucent fill, backdrop blur and a hairline highlight border — from four controls.",
    content:
      "- The glassmorphism generator has four controls: a Backdrop colour that sets what sits behind the glass, and a Glass tint that sets what the panel is made of.\n- Opacity, from zero to a hundred percent, controls how much of the backdrop shows through; blur, from zero to sixty pixels, controls how much it is smeared.\n- The preview shows exactly that — the backdrop filling the panel with a floating glass tile inset inside it — and the CSS card underneath carries the finished block with a copy button.\n\nThe emitted snippet is five declarations, and each one is doing a specific job. A background declaration, then backdrop-filter with the blur, then the same backdrop-filter repeated with the -webkit- prefix, then a one-pixel border of translucent white, then a sixteen pixel border radius. Copy takes all five together, so the effect carries across as a unit rather than as values to reassemble.\n\nThe background declaration is the first thing worth understanding, because it is not quite what it appears. The tint colour is not written as an rgba() value with the opacity as the fourth argument; instead the opacity percentage is converted to a two-digit hex value and appended to the tint, producing an eight-digit hex where the last two digits are alpha. Twenty percent opacity becomes a round thirty-three out of two hundred and fifty-five, which is twenty-one in hex, so a white tint at twenty percent comes out as an eight-digit value ending in twenty-one. The colour is rendered identically either way, and the hex form keeps the tint as a single token that is easy to swap.\n\nThe webkit line exists because backdrop blur was prefixed for a long time and some rendering engines still honour the older form; emitting both costs one line and removes a class of cross-browser surprise. The border and radius, by contrast, are fixed rather than adjustable — a hairline translucent white edge and sixteen pixels of corner rounding. Those two details do more for the effect than most people expect, because a glass panel with a hard edge and square corners reads as a translucent rectangle instead of a pane.\n\n- Blur does the heavy lifting: a soft backdrop makes the panel read as glass, while a sharp one leaves it looking like tinted film.\n- Opacity decides how much of the underlying content remains visible, and the honest trade is legibility — the more that shows through, the harder text on the panel is to read, and no amount of blur fixes a contrast problem.\n- Checking text against its real composite backing rather than against the tint alone is the step people skip.\n\nTwo limits are worth naming. Because the tint is written as a hex with alpha, this is a hex-based tool; if your workflow needs rgba(), convert the value after copying. And there is no second layer, no inner shadow and no text treatment here, so a full glassmorphism css treatment for a card usually means combining this snippet with your own typography and elevation rules. As a source of the base frosted glass css recipe — a reliable glass effect css block of tinted fill, backdrop blur and hairline edge — this is the shortest route, and the css backdrop blur glass values are the part almost everyone gets subtly wrong by hand.",
    howTo: [
      { step: "Set the Backdrop colour to match what will sit behind the glass." },
      { step: "Choose the Glass tint and adjust Opacity until the amount showing through feels right." },
      { step: "Raise Blur until the backdrop softens; check that text on the panel still reads." },
      { step: "Copy the block — the tint, blur, prefixed blur, hairline border and radius all come with it." },
    ],
    whenToUse:
      "Use this when a panel needs to sit over imagery or a gradient as translucent glass — navigation bars, overlay cards, modal headers. Use the neumorphism generator when the surface should be opaque and shaped by light rather than transparency. Where the panel's own border and inner highlight matter as much as the blur, the {{frosted-glass-generator|frosted glass generator}} treats them as first-class parts of the recipe, and a shadow that belongs to the surface underneath is what the {{shadow-color-generator|shadow color generator}} derives.",
    faqs: [
      {
        q: "Why is the tint written as an eight-digit hex?",
        a: "Because the opacity is converted into the last two digits of a hex value, carrying alpha. It renders the same as an rgba() colour, and keeps the tint as a single token.",
      },
      {
        q: "Can I change the border or the corner radius?",
        a: "Not in this tool — both are fixed at a one-pixel translucent white border and a sixteen-pixel radius. Edit those two declarations after copying if your design needs different values.",
      },
      {
        q: "Why are there two backdrop-filter declarations?",
        a: "The second carries the -webkit- prefix, which older engines require. Emitting both avoids a class of browser inconsistencies at no real cost.",
      },
      {
        q: "How do I keep text readable on the glass?",
        a: "Contrast has to be judged against the final composite, not the tint alone. Raising opacity or blur reduces how much of the backdrop interferes, and checking the actual result is the only reliable test.",
      },
      {
        q: "Will the panel still read as glass over a flat colour?",
        a: "Only faintly — the blur needs detail behind it to smear, so over a flat surface the panel reads as a tinted layer rather than frosted glass. Put it over imagery or a gradient and the effect returns.",
      },
    ],
  },

  "gradient-angle-adjuster": {
    keywords: [
      "gradient angle adjuster",
      "linear gradient angle",
      "change gradient direction",
      "css gradient angle",
      "gradient angle slider",
    ],
    intro:
      "The gradient angle adjuster drives a linear gradient's direction with a 0 to 360 degree slider and writes the finished declaration, stops and all, as copyable CSS.",
    content:
      "- The gradient angle adjuster is laid out as a large preview panel with a single Angle slider beneath it, running the full circle from zero to three hundred and sixty degrees.\n- Below that, a Stops section gives each colour a field and a position slider, and a CSS section prints the result as a background declaration with a copy button.\n- The preview redraws as the slider moves, so the linear gradient angle is chosen against the ramp you are actually shipping.\n\nThe output is the familiar linear-form function with the angle in degrees followed by the stops, each written as a colour and a percentage, so what you copy is a complete declaration rather than a fragment. The default state produces a two-stop gradient from a blue at zero percent to a red at a hundred percent, at ninety degrees, which in CSS points to the right. Dragging the slider through the full circle sweeps the direction of the ramp while the colours stay put, which is the quickest way to see how much a gradient's character depends on its angle rather than its palette — the same two colours read as a horizon, a sidebar or a diagonal depending only on that number. If you only ever need to change gradient direction, the angle slider is the control you will spend the whole session on.\n\n- The angle is always emitted as a number of degrees, never as a direction keyword, so the number is the only thing that identifies the direction.\n- A ninety-degree ramp could be written as to right and would render identically, but this tool does not make that substitution, which keeps the output predictable.\n- Converting an angle into its nearest keyword is a separate job, handled by the angle calculator.\n\nThe stop controls are the second half of the tool and they make it a general linear builder rather than an angle dial. Each stop has a colour field and a percentage slider, so you can move a colour along the ramp, and Add stop appends a new one — seeded with a random colour and parked at fifty percent — which is how you get past a two-colour gradient to a three- or four-colour sweep. Remove appears only when more than two stops remain, so the gradient can never be reduced below the two colours it needs.\n\nIn practice the workflow is to set your colours first, adjust their positions second, and sweep the angle last, because the angle is the variable you judge by eye and the others are decided by intent. It is equally useful as a quick sanity check on a gradient someone else wrote: paste the values in, drag the angle, and see whether the direction was deliberate or arbitrary.\n\nWhat it does not do is radial or conic gradients — this page always emits the linear form, and separate tools cover the other two — and it offers no interpolation controls, so the ramp is interpolated by the browser in its default colour space. There is no keyword direction output and no way to save a gradient you like beyond copying the declaration. Within those bounds, changing gradient direction with a css gradient angle is about as immediate as it can be: one slider, one gradient angle slider, and the CSS updating under your hand.",
    howTo: [
      { step: "Set the stop colours and drag their position sliders to place them on the ramp." },
      { step: "Add stops if the gradient needs more than two colours." },
      { step: "Sweep the angle slider until the direction reads the way you want." },
      { step: "Copy the background declaration from the CSS section." },
    ],
    whenToUse:
      "Use this when a linear gradient needs its direction tuned or its stops placed precisely. Use the gradient angle calculator when you need to know which human-readable direction a degree value corresponds to, or a conic or radial generator for other gradient types. When only two colours are in play, the {{linear-gradient-generator|linear gradient generator}} is the same sweep with fewer controls; when the stops are the subject and the angle is noise, the {{gradient-color-stop-editor|gradient color stop editor}} keeps the axis fixed at ninety degrees.",
    faqs: [
      {
        q: "Does 0 degrees point up?",
        a: "Yes — in CSS, zero degrees points to the top and angles increase clockwise, so ninety degrees points to the right and one hundred and eighty points to the bottom.",
      },
      {
        q: "Why is the direction always written in degrees?",
        a: "The tool never substitutes a keyword such as to right, even when the angle matches one exactly. That keeps the output predictable; use the angle calculator when you want the keyword form.",
      },
      {
        q: "Can it build radial or conic gradients?",
        a: "No. This page always emits a linear gradient. Radial and conic generators exist as separate tools in the same domain.",
      },
      {
        q: "How many stops can I add?",
        a: "As many as you like, though the output gets unwieldy past four or five. Stops can be removed freely, down to a minimum of two.",
      },
      {
        q: "Is the copied value a complete declaration or just the function?",
        a: "Complete: the panel hands over a background declaration, with the angle in degrees first and every stop written as a colour and a percentage after it, so it pastes straight into a rule.",
      },
    ],
  },

  "gradient-angle-calculator": {
    keywords: [
      "gradient angle calculator",
      "css gradient direction",
      "gradient angle to keyword",
      "degrees to turn css",
      "gradient direction converter",
    ],
    intro:
      "The gradient angle calculator converts a degree value into every equivalent form a gradient direction can take — degrees, turns, radians and the nearest direction keyword — with a dial showing which way it points.",
    content:
      "- The gradient angle calculator pairs an angle slider with a circular dial whose line rotates to show the direction.\n- To the right, an Equivalents panel gives four rows for the same angle: degrees, turns, radians, and the nearest CSS direction keyword.\n- Everything updates as the slider moves.\n\nThe reason there are four rows rather than one is that CSS accepts all four forms for the same direction, and they arrive from different places. Degrees come from design tools and the angle slider in a gradient builder. Turns come from animation and design documentation, where a value like a quarter turn is easier to reason about than ninety degrees. Radians come out of calculation functions and geometry code. And keywords come from hand-written CSS, where to bottom right is both readable and unambiguous. Having the table in front of you removes the arithmetic, and the degrees row is formatted so the value can be pasted directly into a gradient declaration.\n\nThe nearest keyword row is the part with a real decision inside it. There are only eight keywords in common use — to top, to top right, to right, to bottom right, to bottom, to bottom left, to left and to top left — so they sit forty-five degrees apart around the circle, and any angle between two of them has to resolve to one or the other. The tool finds the closest by measuring the circular distance between the angle and each of the eight, normalising first so that anything at or above a full turn wraps around properly. That normalisation is what makes three hundred and sixty degrees resolve to to top rather than to to top left, and it is the detail that a naive implementation gets wrong, because an unwrapped angle is the largest possible distance from zero rather than the same direction as it.\n\nDegrees and radians deserve a note about what the conversion means. Radians are the mathematically natural unit — a full circle is two pi — so a quarter turn is a value a bit above one and a half, and the rounded figures here are meant for reading rather than for computing. If you are writing a calculation, use the exact expression rather than a rounded decimal.\n\nThe dial is drawn the way CSS measures: the line rotates by the angle minus ninety degrees, because the reference line starts pointing right while zero degrees in CSS points up. That makes this a gradient angle to keyword conversion at a glance as well as a numeric one. That offset is easy to get wrong by hand and is the reason a direction you set in a builder sometimes comes out rotated ninety degrees when you transcribe it into a diagram.\n\nWhat the tool does not do is generate a gradient — it converts and explains, and the angles it reports are the ones you feed to a builder.\n\n- It does not generate a gradient — it converts and explains angles, so a ramp still needs a builder.\n- It only knows the eight keywords, so an angle of, say, twenty-two degrees reports the nearest of them rather than the direction it actually points to.\n- Used as a css gradient direction reference, though, it answers the question that comes up constantly when reading other people's stylesheets, and as a degrees to turn css and gradient direction converter it covers all four spellings in one view.",
    howTo: [
      { step: "Move the slider to the angle you are working with, or read it off an existing gradient." },
      { step: "Read the dial to confirm which way that direction points on screen." },
      { step: "Take the equivalent you need — degrees for a declaration, turns or radians for documentation." },
      { step: "Use the nearest keyword row when you want the readable form in your CSS." },
    ],
    whenToUse:
      "Use this when translating a gradient direction between degrees, turns, radians and keywords, or when checking which way an angle points. Use the gradient angle adjuster when you need to build the gradient itself rather than convert its direction. When the answer has to become a gradient rather than a number, the {{gradient-angle-adjuster|gradient angle adjuster}} is the same slider with stops attached, and a ramp that needs flipping without being rebuilt is what the {{gradient-reverser|gradient reverser}} does.",
    faqs: [
      {
        q: "Why does the dial line point to the right at 0 degrees?",
        a: "Because the reference line starts horizontal while zero degrees in CSS points up. The line is rotated by the angle minus ninety to compensate, which is why 0 degrees shows it pointing up on the dial.",
      },
      {
        q: "How are the direction keywords spaced?",
        a: "There are eight of them, forty-five degrees apart. An angle between two keywords reports whichever is nearer, measured as circular distance so values near 360 resolve correctly.",
      },
      {
        q: "How many turns is 90 degrees?",
        a: "A quarter — the panel reports it in decimals, so ninety degrees reads as 0.250 turn, alongside about 1.571 radians.",
      },
      {
        q: "Can I get an exact direction rather than a keyword?",
        a: "Only the eight common keywords are covered, so an unusual angle reports the closest of them rather than a custom name. The degrees row always gives the precise value.",
      },
      {
        q: "Can I paste the turns or radians row straight into CSS?",
        a: "Yes — CSS accepts all three units in a gradient function, so 90deg, 0.25turn and 1.5708rad are the same direction written three ways. The keyword row is the one that only applies inside a gradient, since direction keywords are not valid anywhere else.",
      },
    ],
  },

  "gradient-collection-browser": {
    keywords: [
      "gradient collection browser",
      "css gradient presets",
      "gradient library",
      "browse css gradients",
      "copy gradient css",
    ],
    intro:
      "The gradient collection browser presents twelve ready-made two-color gradients with their hex pairs and a one-click copy of each as a CSS background declaration.",
    content:
      "- The gradient collection browser lays twelve gradients out in a responsive grid, three across on a wide screen.\n- Each entry is a card with the gradient rendered across the top and its two hex values beneath, shown as one arrow to the other.\n- The copy button on a card takes the full declaration rather than just the colours, so one click puts a usable background into the clipboard.\n\nThe set covers a wide spread of colour relationships on purpose. There are warm sunset pairs, such as a red-orange running into a deep pink, and a yellow-gold into a burnt orange. There are cool pairs, including a deep navy into a bright cyan, and a sky blue into a saturated blue. There are the more stylised combinations — a violet into magenta, a dark purple into a muted mauve, an aqua into a vivid green — and there are deliberately subdued options, such as a near-black into a slate blue, for when a gradient should sit behind content rather than compete with it. That range is the point of a preset library: between them, the twelve cover the moods most projects actually need.\n\nEvery gradient in the collection is drawn on the same diagonal, one hundred and thirty-five degrees, which runs from top left to bottom right. Fixing the angle is a sensible choice for a browser, because it makes the presets comparable to one another — you are judging the colour pairing, not the direction — and it means every copied declaration has the same shape, so swapping one preset for another in a stylesheet is a one-line change.\n\nThe workflow is deliberately short. Scroll the grid, find the pair that matches the mood, and either copy the declaration as-is or copy it and edit the ones you want to keep. Because the card shows the two hex values beside the preview, it doubles as a way to lift just one colour out of a gradient: read the code, take it to a format converter, and use it as a flat colour elsewhere. That is often the more useful outcome, since a pair that works as a gradient is frequently a pair that works as an accent and a surface.\n\nBeing clear about what it is not: a browser, not a builder. Nothing here is editable, and there is no search, filtering or sorting — the twelve are presented as a fixed grid in a fixed order. Nor is it a searchable library in the sense of hundreds of entries: it is a small curated set, which is a reasonable trade, because a page of twelve gradients is browsable at a glance while a page of two hundred is a search problem. If you want to generate a gradient from your own colours, a builder is the right tool; if you want to modify one of these, the angle adjuster and the stop editor both accept the same syntax.\n\nUsed as a source of css gradient presets, then, this is a fast route from a blank backdrop to something finished: browse css gradients, copy gradient css, and adjust afterwards if needed. As a gradient library it is small on purpose, and as a starting point for a hero background, an avatar placeholder or a card header it covers more ground than its twelve entries suggest.",
    howTo: [
      { step: "Scroll the grid and pick the pair whose mood matches what you need." },
      { step: "Read the two hex values on the card if you only want one of the colours." },
      { step: "Press copy to take the full background declaration, including the angle and both stops." },
      { step: "Adjust the angle or the stops in a gradient builder if the preset needs adapting." },
    ],
    whenToUse:
      "Use this when you want a finished gradient quickly and are happy to work from an existing pair of colours. Use a gradient generator when the colours come from your own palette, or the image gradient tool when they should come from a photograph. A preset whose stops or angle need moving is the {{gradient-color-stop-editor|gradient color stop editor}}'s job, and a ramp that has to be delivered as a file rather than a declaration is what the {{css-gradient-to-image-exporter|CSS gradient to image exporter}} writes out.",
    faqs: [
      {
        q: "Can I edit a preset?",
        a: "Not on this page. The collection is read-only, but you can paste the copied declaration into a gradient builder and change the stops or the angle there.",
      },
      {
        q: "Why are all the gradients on the same diagonal?",
        a: "Every preset uses 135 degrees, running from top left to bottom right. Keeping the angle constant makes the twelve comparable and the copied declarations interchangeable.",
      },
      {
        q: "How do I use just one of the two colours?",
        a: "Each card prints both hex values, so you can copy one into a colour field or a converter and use it as a flat colour instead of a gradient.",
      },
      {
        q: "Is there a search or filter?",
        a: "No. The twelve presets appear as a fixed grid. The set is deliberately small enough to scan rather than search.",
      },
      {
        q: "How do I get just the two hex values from a card?",
        a: "Read them off the card — they are printed as one arrow to the other. The copy button takes the whole background value, so trimming to the pair is a manual selection when that is all you are after.",
      },
    ],
  },

  "gradient-color-stop-editor": {
    keywords: [
      "gradient color stop editor",
      "add gradient stops",
      "gradient stop position",
      "multi stop gradient",
      "three color gradient",
    ],
    intro:
      "The gradient color stop editor gives each color in a gradient its own position control, making it a three-color starting point for building multi stop gradients on a fixed horizontal axis.",
    content:
      "- Three stops are in place from the start — a blue at zero percent, a purple at fifty and a red at a hundred — which is the smallest arrangement that behaves differently from a plain two-colour ramp.\n- Every stop gets a colour field, a position slider and a delete button; Add stop appends another, seeded with a random colour.\n- Under the controls, a preview band shows the result and a CSS card prints the declaration with a copy button.\n\nThe interesting part of the tool is what the position sliders let you do. A gradient between two colours interpolates evenly across the whole element; the moment a third colour arrives, its position determines the shape of the ramp. Park it at fifty percent and you get a balanced three-colour sweep. Push it to ten percent and the first colour becomes a narrow band while the other two fill the rest, which is how you produce the hard-ish edge that gives a gradient a horizon or a stripe. Drag two stops together and you compress the transition between them into a tight line, leaving flat colour on either side. None of that requires anything except moving a slider, which is why this is a better tool for understanding gradients than a previewer is.\n\nThe axis is fixed horizontally — the declaration is always written at ninety degrees, pointing to the right — and that is a deliberate division of labour with the other tools in this domain. With the direction constant you can concentrate on the distribution of colour rather than juggling two variables at once, and when the arrangement is right, that declaration can be handed to an angle tool to be rotated. Each stop is written as a colour followed by its percentage, so the output is a plain, readable linear gradient with as many stops as you have added.\n\nTwo behaviours are worth knowing before you rely on them. New stops are added at a hundred percent, which means a stop you add lands on top of the last one and its position slider has to be dragged back before it becomes visible in the ramp. And removal has no floor: the delete button is present on every row, so it is possible to remove every stop and end up with a declaration that has no colours at all, which renders as nothing. Keeping at least two stops on the board is on you.\n\n- The tool is used two ways: building a three color gradient from scratch by distributing three colours until the ramp balances, and repairing one that looks wrong by looking at where its stops actually sit.\n- Most gradients that read as muddy or banded have their stops bunched in one part of the range, and laying the positions out as sliders shows that faster than reading the declaration does.\n\nWhat it does not offer is an angle control, a radial or conic axis, or the ability to drag stops along the preview band directly — the sliders are the only way in. That is a fair trade for a tool whose subject is position. As a gradient color stop editor it does the one thing that matters, and for add gradient stops with precise gradient stop position control it is quicker than editing the declaration by hand, especially once a multi stop gradient runs past four colours.",
    howTo: [
      { step: "Set the three starting colours, or delete one and add your own with Add stop." },
      { step: "Drag each stop's position slider to distribute the colours along the ramp." },
      { step: "Add further stops for more complex transitions, then drag the new ones back from 100%." },
      { step: "Copy the background declaration from the CSS card." },
    ],
    whenToUse:
      "Use this when a gradient needs its colour distribution tuned — hard edges, tight transitions or a balanced three-colour sweep. Use the gradient angle adjuster when the direction is the problem rather than the stop positions. The {{multi-stop-gradient-builder|multi-stop gradient builder}} adds the angle control this page deliberately lacks, and when a boundary should be genuinely abrupt rather than merely tight, the {{hard-stop-gradient-generator|hard-stop gradient generator}} builds it from paired stops.",
    faqs: [
      {
        q: "Where are new stops added?",
        a: "At 100 percent, so a new stop lands on top of the last one. Drag its slider back to bring it into the ramp — the preview will not change until you do.",
      },
      {
        q: "Can I remove all the stops?",
        a: "Yes, and the declaration will then contain no colours and render as nothing. There is no minimum enforced, so keep at least two on the board.",
      },
      {
        q: "Can I change the angle?",
        a: "No. The declaration is always written at 90 degrees. Copy it into an angle tool if you need a different direction; keeping it fixed keeps the focus on stop positions.",
      },
      {
        q: "What does moving a stop actually change?",
        a: "The shape of the ramp. Stops bunched together create a tight transition and flat colour either side; evenly spaced stops give a smooth sweep from end to end.",
      },
      {
        q: "Do the slider numbers match the percentages in the CSS?",
        a: "Exactly — the slider value is written into the declaration as that percentage, with no conversion in between. If the copied CSS shows a stop at 37%, that is where the slider was sitting.",
      },
    ],
  },

  "gradient-from-image": {
    keywords: [
      "gradient from image",
      "create gradient from photo",
      "image color gradient",
      "extract gradient from picture",
      "photo based gradient css",
    ],
    intro:
      "The gradient from image tool clusters an uploaded photograph into five dominant colors and lays them out as a horizontal five-stop gradient, returning the CSS ready to paste.",
    content:
      "The gradient from image tool is one upload and one result. Drop a picture onto the dropzone and the page reads its colours, then draws a horizontal gradient from them and prints the CSS declaration beneath with a copy button. A Replace image button resets the state. There are no settings — the number of colours and the direction are both fixed.\n\nThe colours come from clustering rather than sampling. The image is shrunk to a small working size and its pixels are grouped into five clusters by similarity, each cluster represented by its average colour. That is a more interesting answer than picking five pixels at random, because clustering finds the colours that actually account for large areas of the image rather than the ones that happen to sit under a particular coordinate. A photograph of a coastline comes back with sky, sea and sand rather than with five near-identical shades of blue.\n\nThe five resulting colours then become the stops of a linear gradient running left to right, spaced evenly at zero, twenty-five, fifty, seventy-five and a hundred percent. Even spacing is deliberate: it makes the output predictable and easy to read, and it keeps the attention on the colours themselves. If a particular colour needs more of the ramp, the declaration is plain CSS and the percentages can be rewritten by hand afterwards.\n\nOne property of the output is worth anticipating. The stops are ordered by cluster index, not by lightness, so the resulting gradient is not necessarily a ramp from dark to light — it may go from a mid blue to a dark green to a pale sand and back. That is a faithful representation of the photograph, and a poor match for situations where you want a tonal progression. If the goal is a scale, sort the five hexes by lightness before using them.\n\nOn determinism, the clustering is seeded at fixed positions rather than randomly, which means the same image produces the same five colours every time. Uploading the same file twice will not give you two different palettes, and neither will a page reload. That is the behaviour you want from a tool whose output is destined for a stylesheet — a colour that changes between runs is a bug rather than a feature.\n\nWhere this is most useful is when an interface has to agree with an image. A hero section, a card, an email header: taking the gradient from the photograph means the treatment is guaranteed to be in the picture's palette rather than near it, and it removes the guesswork from matching. It is also a fast way to get a decorative background that has some relationship to the content, rather than a preset chosen at random — an image color gradient that came from the asset itself, so the two always agree.\n\n- Limits worth noting: five colours and ninety degrees are fixed, transparent pixels are ignored when sampling, and clustering compresses the image's subtler shades into five representatives.\n- There is no way to weight one region over another — the whole frame participates.\n- Within those bounds, to create gradient from photo without leaving the browser is one upload away, and as a way to extract gradient from picture content into a photo based gradient css declaration it removes the colour matching step entirely.",
    howTo: [
      { step: "Drop an image onto the upload area." },
      { step: "Read the resulting five-colour gradient, remembering the stops follow cluster order rather than lightness." },
      { step: "Copy the background declaration and paste it into your stylesheet." },
      { step: "Reorder or re-space the stops by hand if you want a tonal ramp instead." },
    ],
    whenToUse:
      "Use this when a component needs to take its colours from a photograph — hero banners, image cards, email headers. Use the palette extractor when you want the image's colours as discrete swatches rather than as a gradient, or the dominant colour finder for a single value. A set of discrete swatches rather than a ramp is what the {{color-palette-extractor|color palette extractor}} returns, and a single representative value is the {{dominant-color-finder|dominant color finder}}'s answer.",
    faqs: [
      {
        q: "How many colours does it use?",
        a: "Five, found by clustering the image's pixels into five groups and taking each group's average. Both the count and the 90 degree direction are fixed.",
      },
      {
        q: "Is the result the same every time?",
        a: "Yes. The clustering is seeded deterministically, so the same image produces the same five colours on every upload and after every reload.",
      },
      {
        q: "Why is the gradient not light to dark?",
        a: "Because the stops follow cluster order rather than brightness. If you want a tonal progression, sort the five hex values by lightness and reorder the stops in the declaration.",
      },
      {
        q: "Can I use this for a whole photograph?",
        a: "The tool produces a five-colour abstraction of the image, not a reproduction. It works well as a background treatment derived from a photograph rather than as a replacement for it.",
      },
      {
        q: "What happens to the transparent parts of an image?",
        a: "They are skipped when the image is sampled, so a cut-out logo or a PNG with a clear background contributes no colour to the five stops — only the visible areas vote.",
      },
    ],
  },

  "gradient-interpolator": {
    keywords: [
      "gradient interpolator",
      "interpolate between two colors",
      "color steps between two colors",
      "generate color scale",
      "blend two colors evenly",
    ],
    intro:
      "The gradient interpolator generates a fixed number of evenly spaced colors between two endpoints, returning them as discrete swatches rather than a continuous gradient.",
    content:
      "- The gradient interpolator takes two colours and a step count and returns a row of swatches, with From and To set by colour fields.\n- A Steps slider runs from three to fifteen — seven by default — and the row lays out one column per step, so the palette fills the width at any count.\n- Every swatch carries its hex value and a copy button, and the whole row recalculates as either colour changes.\n\nThe distinction between this and a gradient builder is the whole point of the tool, and it is easy to miss. A gradient produces a continuous ramp that the browser paints; what you get here is a list of individual colours that happen to be evenly spaced along the path between the two endpoints. That matters because a great many things cannot accept a gradient at all — chart series, heatmap scales, categorical legends, colour swatches in a design file, an array in a script. A ramp is useless for any of those, and a set of discrete steps is exactly what is needed.\n\nThe Steps slider sets the count including both endpoints, so seven steps yields the two endpoints plus five colours between them. The spacing is calculated as an even fraction along the interpolation, which means the steps are equally spaced in value but not necessarily in perceived difference — the human eye is more sensitive to change in some parts of the colour space than others, so the middle of the row can look like it moves more slowly than the ends.\n\nThat leads to the one behaviour worth knowing before you use the result. The interpolation is a straight line in the red, green and blue channels, which is the simplest possible blend and not the one that looks best. Blending a mid blue into a red runs through a muted purple in the middle — the halfway point between those two defaults lands at roughly a desaturated violet, and it is noticeably duller than either end. A perceptual interpolation through a colour space designed around how we see would keep the middle more vivid, and some tooling offers that as an option. Here, the straight line is the behaviour, and knowing it explains why some pairs seem to sag in the middle while others stay lively.\n\nIn practice, some pairs interpolate well and others do not. Colours that already sit near each other — a teal into a blue, two neighbouring greens — come out with a smooth, convincing scale. Complementary pairs, where the two endpoints are opposite on the wheel, are the ones that turn muddy in the middle, because the straight line passes near the neutral axis. If a scale looks wrong, changing an endpoint slightly usually improves it more than changing the step count.\n\n- The set is not exported as CSS, a design token document or a chart configuration — the copy buttons take individual values, and assembling an array is a manual step.\n- There is no interpolation-space option and no reversed order.\n- As a way to blend two colors evenly into a usable number of steps, it does one job cleanly: ask for color steps between two colors and this is what you get, laid out and numbered — and it is the fastest way to generate color scale values when interpolate between two colors is the actual requirement rather than a smooth wash.",
    howTo: [
      { step: "Set the From and To colours." },
      { step: "Choose a step count with the slider — the endpoints are included in the total." },
      { step: "Copy individual hex values from the swatches, or read the row as a scale." },
      { step: "Adjust an endpoint rather than the step count if the middle of the scale looks dull." },
    ],
    whenToUse:
      "Use this when you need a fixed number of discrete colours between two values — a chart scale, a legend, a heatmap ramp. Use a gradient generator when you want a continuous painted ramp instead of steps. The continuous version of the same maths is the {{linear-gradient-generator|linear gradient generator}}, and a ramp that has to pass through a third colour rather than straight between two is what the {{multi-stop-gradient-builder|multi-stop gradient builder}} builds.",
    faqs: [
      {
        q: "How is this different from a gradient?",
        a: "It returns individual colours, not a painted ramp. Charts, scales, legends and design files take discrete values, which is what the numbered steps are for.",
      },
      {
        q: "Do the steps include the two endpoints?",
        a: "Yes. Seven steps means the From colour, five intermediate colours, and the To colour. Three is the minimum, and fifteen the maximum.",
      },
      {
        q: "Why do some pairs look muddy in the middle?",
        a: "The blend is a straight line through the red, green and blue channels. Complementary pairs pass close to neutral in the middle and come out duller; neighbouring hues stay smooth.",
      },
      {
        q: "Can I export the whole scale?",
        a: "Not as a block. Each swatch has its own copy button, so assembling an array or a token list is a manual step after copying the values you need.",
      },
      {
        q: "Can I flip the order without changing the colours?",
        a: "Swap the two fields — the row always runs From to To, so reversing the inputs mirrors the sequence. There is no separate reverse control, and the set of colours is the same either way.",
      },
    ],
  },
};
