import type { ToolSeo } from "@/components/shared/seo-types";

/**
 * Colors domain editorial SEO — batch 26.
 *
 * Leftovers that fall earlier in the alphabet than the batch 23-25 window but have no
 * authored sibling and no flagged problem of their own: palette-sorter, the seasonal
 * palette preset and the zodiac palette. After this batch no slug in the registry can
 * be documented honestly without either differentiating a duplicated component or
 * repairing a slug whose name promises something the component does not do.
 *
 * Deliberately left unauthored here (duplicate or promise mismatch): emotion-color-finder
 * (slug promises emotion-to-colour, the component hashes the name to arbitrary hues),
 * random-palette-generator (the same random swatch roll as the authored
 * random-color-generator), and the 80 slugs already recorded in the audit list.
 */
export const SEO_BATCH_26: Record<string, ToolSeo> = {
  "palette-sorter": {
    keywords: [
      "palette sorter",
      "sort colors by hue",
      "sort by oklch lightness",
      "sort by chroma",
    ],
    intro:
      "The palette sorter orders any list of colours by hue, by OKLCH lightness or by chroma — three sorts that each reveal a different structure in the same palette.",
    content:
      "Order is information. The same six colours in one sequence read as a ramp and in another as a set, so the palette sorter offers three ways to sort a list and lets the arrangement say what the palette is actually made of. Colours are entered or edited in a list on the left; three buttons on the right apply the sorts, and each one reorders the list in place.\n\n- Sort colors by hue: orders colours around the wheel, which turns a palette into a spectrum and exposes gaps where a hue family is missing.\n- Sort by oklch lightness: orders from dark to light, which reads like an elevation ladder and is the fastest way to see whether a set has usable surfaces.\n- Sort by chroma: orders from muted to saturated, which separates the quiet colours from the loud ones and usually identifies the accent by position.\n- Every sort runs on OKLCH coordinates, so the hue order follows perceptual spacing rather than the raw numbers of the input format.\n\nSorting by hue answers a question about coverage: a palette that looks varied at a glance often turns out to occupy one narrow arc of the wheel, and the sorted strip makes that obvious. Sorting by lightness answers a question about structure: if the first four values are all in the 0.5 to 0.7 band, the palette has no surfaces and no ink, whatever its colours are. Sorting by chroma answers a question about emphasis: the value at the loud end is going to be read as the accent whether you intended it or not. Each sort is reversible in the sense that the palette is rebuilt from the same values, so nothing is lost by trying all three.\n\n- Sorting never changes a colour, only its position, so a palette that was unbalanced before stays unbalanced.\n- No descending option on any sort: the direction is fixed as the tool defines it.\n- No export and no persistence. The order has to be copied out manually, and the page starts from its default set each visit.\n- Nothing measures contrast, so a palette that sorts neatly can still be unusable for text.\n\nIt also helps to know that the sorts compose rather than compete: hue order answers where the palette sits on the wheel, oklch lightness order answers how much tonal range it has, and chroma order answers which value will read as the accent whether or not you intended one. Applying all three in a row turns a palette review into three specific questions instead of one vague impression.\n\nThe useful habit is to sort before you finalise, not after. A set that survives all three arrangements — spread across hues, laddered by lightness, distinct in chroma — is almost always a stronger palette than one that only looks good in the order it was typed. When the arrangement is for a reader rather than for you, sort by hue for swatch sheets and by lightness for scales and legends, and keep the unsorted order for anything that has to match a source document exactly.",
    howTo: [
      { step: "Enter or edit the palette in the list, adding and removing rows as needed." },
      { step: "Press the hue sort to see how much of the wheel the palette covers." },
      { step: "Press the lightness sort to find out whether the set contains real surfaces and inks." },
      { step: "Press the chroma sort to identify the accent by position rather than by opinion." },
    ],
    whenToUse:
      "Use this when a palette's order matters — a swatch sheet, a legend, a scale, or a set that needs auditing for coverage. The {{palette-comparison|palette comparison}} tool measures two palettes against each other, the {{palette-importer|palette importer}} is where an existing list comes from, and the {{palette-balance-analyzer|palette balance analyzer}} reports the averages that a sort only hints at.",
    faqs: [
      {
        q: "What do the three sorts actually order by?",
        a: "Hue angle, OKLCH lightness and OKLCH chroma respectively. All three use the same perceptual colour space, so the orders are stable for a given set of values.",
      },
      {
        q: "Can I reverse a sort or choose the direction?",
        a: "Not on this page. Each sort has one fixed direction, and the list can be edited afterwards but not flipped with a control.",
      },
      {
        q: "Does sorting fix a bad palette?",
        a: "No. Ordering changes how the palette reads, not what it contains. A set with no dark values still has no dark values after sorting.",
      },
      {
        q: "Which sort should I use before shipping a palette?",
        a: "Lightness first — it exposes whether the set can cover surfaces, text and borders at all. Then chroma, which shows what will be read as the accent by accident.",
      },
      {
        q: "Is the sorted palette saved?",
        a: "No. Nothing persists, and the page returns to its default colours on the next visit, so copy the values out once the order is settled.",
      },
    ],
  },

  "seasonal-palette-generator": {
    keywords: [
      "seasonal palette generator",
      "season color palettes",
      "spring summer autumn winter colors",
      "deterministic season palette",
    ],
    intro:
      "The seasonal palette generator maps spring, summer, autumn and winter onto four fixed hue runs, giving season color palettes that are fully deterministic — the same season always returns the same five swatches.",
    content:
      "This page is the exception in the random-palette family: nothing about it is rolled. Each season owns a fixed run of five hues, and every swatch is placed with a lightness cycle of 0.55, 0.67, 0.79, 0.55 and 0.67 at a constant chroma of 0.14. Choose a season and the strip is rebuilt from those numbers; choose it again tomorrow and you will get the same result. That makes a seasonal palette generator unusually useful for anything a design system has to reproduce.\n\n- Spring — hues 80, 110, 50, 160 and 200: yellow-green, green, gold, teal-green and blue.\n- Summer — hues 200, 220, 180, 30 and 60: two blues, a cyan, an orange and a yellow.\n- Autumn — hues 25, 40, 15, 60 and 350: rust, ochre, brown-orange, mustard and a red-pink.\n- Winter — hues 240, 260, 220, 280 and 200: indigo, violet, blue, purple and cyan-blue.\n\nThe lightness cycle is what gives each run its rhythm. Because it repeats across five slots, the first and fourth swatches share a lightness, the second and fifth match, and the third sits alone at the lightest value — so each season's strip has a peak in the middle and a pair of parallel values either side, rather than a single monotonically rising ramp. Chroma is constant at 0.14, which is vivid enough to read as a season and muted enough that the four runs feel like members of one family rather than four unrelated palettes.\n\n- Only four presets, and no way to adjust hue, lightness or chroma from the page.\n- The runs are untitled set lists rather than sampled photographs, so they read as a season's colour family rather than as a month's palette.\n- Nothing in any run is dark; no text colour and no deep surface is supplied.\n- No export beyond copying individual hex values, and no CSS block on this page.\n\nIt is worth being explicit about what the determinism buys. A deterministic season palette can be written straight into a stylesheet as constants and reviewed like any other token, whereas a rolled palette has to be captured before anyone can discuss it. Because the four season color palettes share a chroma and a lightness structure, they also behave consistently as a family: a component styled for spring will not break when the theme switches to winter, which is the property a rotating theme actually needs.\n\nUse it for editorial and campaign work that has to be consistent across a year, for product themes that change with the calendar, and anywhere a seasonal rotation should be recognisable rather than constantly new. Because the values never change, they can be written into a stylesheet as constants; the spring summer autumn winter colors then behave like tokens rather than like rolls. Where the palette itself should be random, use the random or daily generators instead, and where a specific season needs more depth, take one value into the shade and tint tools.",
    howTo: [
      { step: "Choose a season from the dropdown; the strip rebuilds from that season's fixed hues." },
      { step: "Read the five swatches, noting that lightness peaks at the third and repeats elsewhere." },
      { step: "Copy the hex values you need — they are stable, so they can safely become tokens." },
      { step: "Add a dark tone from the shade tools if the palette has to carry text." },
    ],
    whenToUse:
      "Use this when a palette has to be reproducible across a year of campaigns or themes. The {{random-palette-generator|random palette generator}} is the unconstrained alternative, the {{color-tints-generator|tints generator}} and {{color-shades-generator|shades generator}} add the depth no season run contains, and the {{css-color-variables-generator|CSS variables generator}} turns a chosen season into named tokens.",
    faqs: [
      {
        q: "Are the palettes generated randomly?",
        a: "No. Each season has a fixed hue run, a constant chroma of 0.14 and a repeating lightness cycle, so a season always produces exactly the same five values.",
      },
      {
        q: "Why does the lightness pattern repeat instead of rising?",
        a: "The cycle is 0.55, 0.67 and 0.79 applied across five slots, so the third swatch is the lightest and the others pair up. That gives each season a peak rather than a slope.",
      },
      {
        q: "Is there a way to tweak the season's colours?",
        a: "Not on this page. Hue, lightness and chroma are all fixed per season; to shift a season, take a swatch into the channel adjusters or hue rotator.",
      },
      {
        q: "Can the four seasons be used in one interface?",
        a: "They can, since all four share a chroma and a lightness structure, but the hues are unrelated, so a page that shows two seasons at once should give one of them the dominant role.",
      },
      {
        q: "Do these values work as text colours?",
        a: "No. At chroma 0.14 they are surface and accent colours, and nothing in any season is dark enough for body text.",
      },
    ],
  },

  "zodiac-color-generator": {
    keywords: [
      "zodiac color generator",
      "zodiac sign colors",
      "horoscope color palette",
      "astrology color",
      "birthday sign palette",
    ],
    intro:
      "The zodiac color generator gives each of the twelve signs a five-color palette, derived deterministically from the letters of the sign's own name.",
    content:
      "A dropdown lists the twelve signs from Aries to Pisces, and a card beneath it renders a palette labelled with whichever sign is chosen. Each palette holds five swatches; change the sign and the five colours change with it, and return to a sign you have visited before and the identical values come back.\n\nThat repeatability is the whole mechanism, and it is worth stating plainly. The sign's name is fed through a small rolling hash — each character folded into a running total that is reduced to a number between zero and three hundred and fifty-nine — and that number becomes the base hue. The five swatches are then spaced forty-seven degrees apart around the wheel from that hue, so the palette is a slice of the colour circle at a fixed arc rather than a themed set of colours.\n\nLightness cycles through three values across the five swatches and chroma is fixed, so every zodiac palette carries the same structure and the same apparent weight; only the base hue moves. Two signs whose hashes land close together therefore produce visibly similar palettes, and nothing tries to keep them apart — there is no spacing between names, no re-roll and no seed to change.\n\nBecause the base hue comes out of a hash, the palettes vary in character without anyone choosing them. Some signs land on a red-orange base and produce a warm set, others land in the blues and come out cool, and a few land near the yellow-green boundary, where the forty-seven degree steps travel through unusual territory. Nothing corrects that and nothing should — the variety is what makes each sign's set recognisable on sight.\n\nIt is also not astrology. No ephemeris, ruling planets or traditional correspondences are consulted, and the hue for Aries follows from the letters of the word rather than from any reference. Read that way the tool is honest and useful: a stable way to attach a reproducible palette to a label, which is exactly what it claims to be.\n\nThat has real uses — themed content where every sign needs an identifiable colour, a quiz or horoscope page that should look the same on every visit, avatars or badges whose colours must not change. Because the derivation is a hash of the name, the same approach generalises to any label, which is what makes the output stable rather than lucky.\n\nThe palette is also stable across sessions and devices, which is more than the random generators in this domain can claim: a visitor returning to the same sign sees the same five colours, so a badge, an avatar or a chart series does not change between visits. That stability is the property that makes the approach worth using at all, and it comes from the hash rather than from any stored data.\n\n- Limits: twelve fixed names, five swatches each, no date-range input, no brightness or saturation control, no export and no astrology color data at all.\n- Used as a zodiac color generator it hands over a horoscope color palette that never changes between visits, and for zodiac sign colors as a birthday sign palette it is one selection and a stable set of five.",
    howTo: [
      { step: "Choose a sign from the dropdown, from Aries to Pisces." },
      { step: "Read the five swatches in the card labelled with that sign." },
      { step: "Switch signs to compare palettes, and switch back — the same sign always returns the same five colours." },
    ],
    whenToUse:
      "Use this when themed content needs a reproducible palette per sign — horoscope pages, quizzes, badges, seasonal features. Use the zodiac generators for travel or gemstones when the palette should follow a supplied dataset rather than a hash of the name. For the neighbouring steps, see the {{daily-color-generator|daily color generator}} and the {{color-of-the-year-browser|color of the year browser}}.",
    faqs: [
      {
        q: "Why does the same sign always give the same colours?",
        a: "The sign's name is run through a rolling hash that produces a base hue, and the five swatches are placed at fixed offsets from it. Nothing in the calculation is random.",
      },
      {
        q: "Are the colours based on astrology?",
        a: "No. No planets, elements or traditional correspondences are used — the palette follows the letters of the sign's name and nothing else.",
      },
      {
        q: "Can two signs give similar palettes?",
        a: "Yes. Nothing spaces the signs apart, so two names whose hashes land close on the wheel produce palettes that look alike.",
      },
      {
        q: "Can I change the brightness or saturation?",
        a: "No. Lightness cycles through three fixed values and chroma is constant, so only the base hue varies between signs.",
      },
      {
        q: "What does the zodiac color generator not do?",
        a: "Used as a zodiac color generator it hands over a horoscope color palette that never changes between visits, and for zodiac sign colors as a birthday sign palette it is one selection and a stable set of five.",
      },
    ],
  },
};
